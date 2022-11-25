FROM maven:3-amazoncorretto-17 as maven
LABEL COMPANY="Mayas"
LABEL MAINTAINER="mayasaehcom@gmail.com"
LABEL APPLICATION="Mai Gateway"

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN mvn package 

FROM tomcat:8-jdk17-corretto
ARG TOMCAT_FILE_PATH=/docker 
	
#Data & Config - Persistent Mount Point
ENV APP_DATA_FOLDER=/var/lib/mai-gateway
#ENV SAMPLE_APP_CONFIG=${APP_DATA_FOLDER}/config/
	
ENV CATALINA_OPTS="-Xms1024m -Xmx1024m -XX:MetaspaceSize=512m -XX:MaxMetaspaceSize=512m -Xss512k"

#Move over the War file from previous build step
WORKDIR /usr/local/tomcat/webapps/
COPY --from=maven /usr/src/app/target/mai-gateway.war /usr/local/tomcat/webapps/mai-gateway.war
COPY --from=maven /usr/src/app/application.yaml /usr/local/tomcat/webapps/application.yaml

#COPY ${TOMCAT_FILE_PATH}/* ${CATALINA_HOME}/conf/

WORKDIR $APP_DATA_FOLDER

EXPOSE 8080
ENTRYPOINT ["catalina.sh", "run"]