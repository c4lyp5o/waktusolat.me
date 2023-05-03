pipeline {
    agent any

    stages {
        stage('Purge') {
            steps {
                script {
                    def container = dockerContainer(name: 'waktusolat.me-api')
                    if (container) {
                        sh "docker stop ${container.id}"
                        sh "docker rm ${container.id}"
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
