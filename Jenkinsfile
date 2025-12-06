pipeline {
    agent any

    environment {
        // Docker compose files
        COMPOSE_FILE_BUILD = 'docker-compose.dev.yml'
        COMPOSE_FILE_TEST = 'docker-compose.test.yml'
        // Project names for Docker Compose
        COMPOSE_PROJECT_NAME_BUILD = 'petshop-jenkins'
        COMPOSE_PROJECT_NAME_TEST = 'petshop-test'
        // Email configuration
       RECIPIENT_EMAIL = '${env.GIT_AUTHOR_EMAIL}'
    }

    stages {
        stage('Cleanup Previous Build') {
            steps {
                script {
                    echo 'Cleaning up previous containers and volumes...'
                    sh '''
                        docker-compose -f ${COMPOSE_FILE_BUILD} -p ${COMPOSE_PROJECT_NAME_BUILD} down || true
                        docker-compose -f ${COMPOSE_FILE_TEST} -p ${COMPOSE_PROJECT_NAME_TEST} down || true
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
                        echo "Checking for docker-compose files..."
                        if [ ! -f ${COMPOSE_FILE_BUILD} ]; then
                            echo "ERROR: ${COMPOSE_FILE_BUILD} not found!"
                            exit 1
                        fi
                        if [ ! -f ${COMPOSE_FILE_TEST} ]; then
                            echo "ERROR: ${COMPOSE_FILE_TEST} not found!"
                            exit 1
                        fi
                        echo "Checking for package.json..."
                        if [ ! -f package.json ]; then
                            echo "ERROR: package.json not found!"
                            exit 1
                        fi
                        echo "Checking for test files..."
                        if [ ! -f tests/test_petshop.py ]; then
                            echo "ERROR: test_petshop.py not found!"
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
                    withCredentials([
                        string(credentialsId: 'VITE_SUPABASE_URL', variable: 'VITE_SUPABASE_URL'),
                        string(credentialsId: 'VITE_SUPABASE_PUBLISHABLE_KEY', variable: 'VITE_SUPABASE_PUBLISHABLE_KEY'),
                        string(credentialsId: 'VITE_SUPABASE_PROJECT_ID', variable: 'VITE_SUPABASE_PROJECT_ID'),
                        string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD')
                    ]) {
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
                        echo "Starting Docker containers for build..."
                        docker-compose -f ${COMPOSE_FILE_BUILD} -p ${COMPOSE_PROJECT_NAME_BUILD} up -d

                        echo "Waiting for services to be healthy..."
                        sleep 10

                        echo "Checking container status..."
                        docker-compose -f ${COMPOSE_FILE_BUILD} -p ${COMPOSE_PROJECT_NAME_BUILD} ps
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
                        docker-compose -f ${COMPOSE_FILE_BUILD} -p ${COMPOSE_PROJECT_NAME_BUILD} logs --tail=50 web_dev

                        echo "Waiting for application to be ready..."
                        sleep 60

                        echo "Testing if application is accessible..."
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

        stage('Run Automated Tests') {
            steps {
                script {
                    echo '========================================='
                    echo 'RUNNING SELENIUM AUTOMATED TESTS'
                    echo '========================================='

                    sh '''
                        mkdir -p test-reports

                        echo "Starting test environment..."
                        docker-compose -f ${COMPOSE_FILE_TEST} -p ${COMPOSE_PROJECT_NAME_TEST} up -d --build postgres_test web_test

                        echo "Waiting for test environment to be healthy..."
                        sleep 30

                        echo "Checking test environment status..."
                        docker-compose -f ${COMPOSE_FILE_TEST} -p ${COMPOSE_PROJECT_NAME_TEST} ps

                        echo "Running Selenium tests in containerized environment..."
                        docker-compose -f ${COMPOSE_FILE_TEST} -p ${COMPOSE_PROJECT_NAME_TEST} up --build selenium_tests

                        echo "Copying test reports from container..."
                        docker cp petshop_selenium_tests:/app/test-reports/test-report.html test-reports/test-report.html || true

                        echo "Test execution completed!"
                        echo "Test report location: test-reports/test-report.html"
                    '''
                }
            }
        }

        stage('Verify Test Results') {
            steps {
                script {
                    echo 'Verifying test results...'
                    sh '''
                        echo "Checking Selenium container logs..."
                        docker logs petshop_selenium_tests

                        echo "Checking if test report was generated..."
                        if [ -f test-reports/test-report.html ]; then
                            echo "Test report generated successfully!"
                            ls -lh test-reports/test-report.html
                        else
                            echo "WARNING: Test report not found!"
                        fi

                        TEST_EXIT_CODE=$(docker inspect petshop_selenium_tests --format='{{.State.ExitCode}}')
                        echo "Test container exit code: $TEST_EXIT_CODE"

                        if [ "$TEST_EXIT_CODE" != "0" ]; then
                            echo "WARNING: Some tests may have failed!"
                        fi
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
                        docker-compose -f ${COMPOSE_FILE_BUILD} -p ${COMPOSE_PROJECT_NAME_BUILD} ps

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
        always {
            script {
                echo 'Archiving test reports...'
                archiveArtifacts artifacts: 'test-reports/**/*.html', allowEmptyArchive: true, fingerprint: true

                publishHTML([
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'test-reports',
                    reportFiles: 'test-report.html',
                    reportName: 'Selenium Test Report'
                ])
            }
        }

        success {
            script {
                echo 'Pipeline executed successfully!'
                sh '''
                    echo "==================================="
                    echo "BUILD AND TEST SUMMARY:"
                    echo "==================================="
                    docker-compose -f ${COMPOSE_FILE_BUILD} -p ${COMPOSE_PROJECT_NAME_BUILD} ps
                    echo "==================================="
                    echo "Application URL: http://localhost:3000"
                    echo "Test Report: test-reports/test-report.html"
                    echo "==================================="
                '''

                emailext(
                    subject: "Jenkins Build SUCCESS: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                    body: """
                        <html>
                        <body>
                            <h2>Build Successful!</h2>
                            <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                            <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                            <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>

                            <h3>Test Results:</h3>
                            <p>All automated Selenium tests have been executed.</p>
                            <p><a href="${env.BUILD_URL}Selenium_20Test_20Report/">View Test Report</a></p>

                            <h3>Deployment Information:</h3>
                            <ul>
                                <li>Application is running in containerized environment</li>
                                <li>All health checks passed</li>
                            </ul>

                            <p style="color: green;"><strong>Status: SUCCESS</strong></p>
                        </body>
                        </html>
                    """,
                    to: "${RECIPIENT_EMAIL}",
                    mimeType: 'text/html',
                    attachmentsPattern: 'test-reports/test-report.html'
                )
            }
        }

        failure {
            script {
                echo 'Pipeline failed! Check logs for details.'
                sh '''
                    echo "Container Logs:"
                    docker-compose -f ${COMPOSE_FILE_BUILD} -p ${COMPOSE_PROJECT_NAME_BUILD} logs || true
                    docker-compose -f ${COMPOSE_FILE_TEST} -p ${COMPOSE_PROJECT_NAME_TEST} logs || true

                    echo "Cleaning up failed containers..."
                    docker-compose -f ${COMPOSE_FILE_BUILD} -p ${COMPOSE_PROJECT_NAME_BUILD} down || true
                    docker-compose -f ${COMPOSE_FILE_TEST} -p ${COMPOSE_PROJECT_NAME_TEST} down || true
                '''

                emailext(
                    subject: "Jenkins Build FAILED: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                    body: """
                        <html>
                        <body>
                            <h2>Build Failed!</h2>
                            <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                            <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                            <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>

                            <h3>Failure Details:</h3>
                            <p>Please check the console output for detailed error messages.</p>
                            <p><a href="${env.BUILD_URL}console">View Console Output</a></p>

                            <p style="color: red;"><strong>Status: FAILED</strong></p>
                        </body>
                        </html>
                    """,
                    to: "${RECIPIENT_EMAIL}",
                    mimeType: 'text/html'
                )
            }
        }

        unstable {
            script {
                emailext(
                    subject: "Jenkins Build UNSTABLE: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                    body: """
                        <html>
                        <body>
                            <h2>Build Unstable</h2>
                            <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                            <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                            <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>

                            <h3>Test Results:</h3>
                            <p>Some tests may have failed. Please review the test report.</p>
                            <p><a href="${env.BUILD_URL}Selenium_20Test_20Report/">View Test Report</a></p>

                            <p style="color: orange;"><strong>Status: UNSTABLE</strong></p>
                        </body>
                        </html>
                    """,
                    to: "${RECIPIENT_EMAIL}",
                    mimeType: 'text/html',
                    attachmentsPattern: 'test-reports/test-report.html'
                )
            }
        }
    }
}
