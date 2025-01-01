#!/bin/bash
# run this script to build all environments

# 환경 목록 정의
ENVIRONMENTS=("kjm0703" "kjs0928")

# 각 환경별 빌드 실행
for env in "${ENVIRONMENTS[@]}"; do
    echo "====================================="
    echo "Building for environment: $env"
    echo "====================================="
    
    # Docker 빌드
    docker build \
        --platform linux/arm64 \
        --build-arg MODE=${env} \
        --tag marotik/lecture_management_vue_app_${env} .
    
    # 빌드 결과 확인
    if [ $? -eq 0 ]; then
        echo "✅ Build successful for $env"
        
        # Docker Hub에 푸시
        docker push marotik/lecture_management_vue_app_${env}
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully pushed image for $env"
        else
            echo "❌ Failed to push image for $env"
            exit 1
        fi
    else
        echo "❌ Failed to build for $env"
        exit 1
    fi
    
    echo ""
done

echo "====================================="
echo "🎉 All environments built and pushed successfully!"
echo "=====================================" 