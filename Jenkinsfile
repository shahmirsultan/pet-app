pipeline {
    agent any

    environment {
        // Docker compose file for development
        COMPOSE_FILE = 'docker-compose.dev.yml'
        // Project name for Docker Compose
        COMPOSE_PROJECT_NAME = 'petshop-jenkins'
    }

    stages {
        stage('Cleanup Previous Build') {
            steps {
                script {
                    echo 'Cleaning up previous containers and volumes...'
                    sh '''
                        docker-compose -f ${COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} down || true
                        docker system prune -f
                    '''
                }
            }
        }

        stage('Checkout Code') {
            steps {
                echo 'Fetching code from GitHub repository...'
                git branch: 'main',
                    url: 'https://github.com/shahmirsultan/pet-app.git'
            }
        }

        stage('Verify Files') {
            steps {
                script {
                    echo 'Verifying required files exist...'
                    sh '''
                        ls -la
                        echo "Checking for docker-compose.dev.yml..."
                        if [ ! -f ${COMPOSE_FILE} ]; then
                            echo "ERROR: ${COMPOSE_FILE} not found!"
                            exit 1
                        fi
                        echo "Checking for package.json..."
                        if [ ! -f package.json ]; then
                            echo "ERROR: package.json not found!"
                            exit 1
                        fi
                        echo "All required files are present."
                    '''
                }
            }
        }

        stage('Load Environment Variables') {
            steps {
                script {
                    echo 'Loading environment variables...'
                    // Use Jenkins credentials or environment variables
                    withCredentials([
                        string(credentialsId: 'VITE_SUPABASE_URL', variable: 'VITE_SUPABASE_URL'),
                        string(credentialsId: 'VITE_SUPABASE_PUBLISHABLE_KEY', variable: 'VITE_SUPABASE_PUBLISHABLE_KEY'),
                        string(credentialsId: 'VITE_SUPABASE_PROJECT_ID', variable: 'VITE_SUPABASE_PROJECT_ID'),
                        string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD')
                    ]) {
                        // Create .env file for docker-compose
                        sh '''
                            echo "Creating .env file..."
                            cat > .env << EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID}
DB_PASSWORD=${DB_PASSWORD}
EOF
                            echo ".env file created successfully"
                        '''
                    }
                }
            }
        }

        stage('Build Application') {
            steps {
                script {
                    echo 'Building application in containerized environment...'
                    sh '''
                        echo "Starting Docker containers..."
                        docker-compose -f ${COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} up -d

                        echo "Waiting for services to be healthy..."
                        sleep 10

                        echo "Checking container status..."
                        docker-compose -f ${COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} ps
                    '''
                }
            }
        }

        stage('Verify Build') {
            steps {
                script {
                    echo 'Verifying application build...'
                    sh '''
                        echo "Checking if web container is running..."
                        docker ps | grep petshop_web_dev || exit 1

                        echo "Checking web service logs..."
                        docker-compose -f ${COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} logs --tail=50 web_dev

                        echo "Waiting for application to be ready (this may take 1-2 minutes)..."
                        sleep 60

                        echo "Checking logs again after wait..."
                        docker-compose -f ${COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} logs --tail=20 web_dev

                        echo "Testing if application is accessible..."
                        # Try multiple times in case it's still starting
                        for i in 1 2 3 4 5; do
                            echo "Attempt $i to connect to application..."
                            if docker exec petshop_web_dev wget --spider -q http://localhost:3000; then
                                echo "Application is accessible!"
                                break
                            else
                                echo "Not ready yet, waiting 10 more seconds..."
                                sleep 10
                            fi
                        done
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo 'Performing health checks...'
                    sh '''
                        echo "Database Health Check..."
                        docker exec petshop_db_dev pg_isready -U petshop_user -d petshop_db_dev

                        echo "Container Status..."
                        docker-compose -f ${COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} ps

                        echo "Network Connectivity..."
                        docker network ls | grep petshop

                        echo "Volume Status..."
                        docker volume ls | grep petshop
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully! Application is running.'
            echo 'Access the application at: http://your-ec2-ip:3000'
            sh '''
                echo "==================================="
                echo "Deployment Summary:"
                echo "==================================="
                docker-compose -f ${COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} ps
                echo "==================================="
                echo "Application URL: http://localhost:3000"
                echo "Database Port: 5433"
                echo "==================================="
            '''
        }
        failure {
            echo 'Pipeline failed! Check logs for details.'
            sh '''
                echo "Container Logs:"
                docker-compose -f ${COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} logs
                echo "Cleaning up failed containers..."
                docker-compose -f ${COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} down
            '''
        }
        always {
            echo 'Pipeline execution completed.'
        }
    }
}
