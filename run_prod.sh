#!/bin/bash

echo Generate keypair
openssl genrsa -out key.pem 8192 && openssl rsa -in key.pem -outform PEM -pubout -out public.pem
echo Pull images
docker-compose pull
echo Start stack...
docker-compose up -d 
echo Waiting for db init...
sleep 50
echo Patch docker-compose file
patch < docker-compose.patch
echo Remove init-db container
docker rm conductor_init-db-app_1 -f
echo Bye!