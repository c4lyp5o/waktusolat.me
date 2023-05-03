pipeline {
    agent any

    stages {
        stage('Purge') {
            steps {
                sh "docker stop waktusolat.me-api || true"
                sh "docker rm waktusolat.me-api || true"
            }
        }
        stage('Build') {
            steps {
                echo 'Building new image..'
                sh "docker build . -t waktusolat.me-api"
                echo 'Done'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
                sh "docker run -d -p 8002:8002 --name waktusolat.me-api waktusolat.me-api:latest"
                echo 'Done'
            }
        }
    }
} 
