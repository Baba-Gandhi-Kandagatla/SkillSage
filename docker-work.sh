#!/bin/bash

docker builder prune -f

cd frontend
docker build -t skillsage-frontend .
docker tag skillsage-frontend bharadwajreddy1406/skillsage-frontend:latest
cd ..

cd backend
docker build -t skillsage-backend .
docker tag skillsage-backend bharadwajreddy1406/skillsage-backend:latest
cd ..

docker login
docker push bharadwajreddy1406/skillsage-frontend:latest
docker push bharadwajreddy1406/skillsage-backend:latest