pipeline {
    agent any

    stages {
        stage('Purge') {
            steps {
                script {
                    def image = docker.image('waktusolat.me-api:latest')
                    def container = image.runningContainer

                    if (container) {
                        container.stop()
                        container.remove()
                    }
                }
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
