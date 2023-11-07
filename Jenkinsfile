pipeline {
    agent any

    environment {
        telegramBotToken = credentials('telegram-bot-token')
        telegramChatId = credentials('telegram-chat-id')        
    }

    stages {
        stage('Informing through telegram') {
            steps {
                sh "curl -sS https://api.telegram.org/bot$telegramBotToken/sendMessage -d chat_id=$telegramChatId -d text='🔨 Building ${env.JOB_NAME} #${env.BUILD_NUMBER}...'"
            }
        }
        stage('Purge') {
            steps {
                echo 'Stopping container and removing current container..'
                sh "docker stop waktusolat.me-api || true && docker rm waktusolat.me-api || true"
                echo 'Done'
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

    post {
        failure {
            script {
                def message = "❌ Build failed for ${env.JOB_NAME} #${env.BUILD_NUMBER}."
                sh "curl -sS https://api.telegram.org/bot$telegramBotToken/sendMessage -d chat_id=$telegramChatId -d text='${message}'"
            }
        }

        success {
            script {
                def prUrl = ''
                try {
                    def prNumber = sh(
                        script: 'git ls-remote --exit-code --heads origin "pull/*/head" | cut -d"/" -f3',
                        returnStdout: true
                    ).trim()
                    prUrl = "https://github.com/c4lyp5o/waktusolat.me-api/pull/${prNumber}"
                } catch (e) {
                    // Do nothing
                }
                def message = "✅ Build succeeded for ${env.JOB_NAME} #${env.BUILD_NUMBER}."
                if (prUrl != '') {
                    message += "\n🔗 PR: ${prUrl}"
                }
                sh "curl -sS https://api.telegram.org/bot$telegramBotToken/sendMessage -d chat_id=$telegramChatId -d text='${message}'"
            }
        }
    }
}