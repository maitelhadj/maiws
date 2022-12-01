FROM maven:3-amazoncorretto-17 as maven
LABEL COMPANY="Mayas"
LABEL MAINTAINER="mayasaehcom@gmail.com"
LABEL APPLICATION="Mai Gateway"

WORKDIR /usr/src/app
COPY . .
RUN mvn package

FROM tomcat:8-jdk17-corretto
	
#Environment variables
ENV APP_DATA_FOLDER=/var/lib/mai-gateway
ENV CATALINA_OPTS="-Xms1024m -Xmx1024m -XX:MetaspaceSize=512m -XX:MaxMetaspaceSize=512m -Xss512k"

ENV LIBRE_TRANSLATE_URL="http://translator:5000"
ENV OPEN_TTS_URL="http://synthesis:5500"

#Move over the War file from previous build step
WORKDIR /usr/local/tomcat/
COPY --from=maven /usr/src/app/target/mai-gateway.war ./webapps/gateway.war

WORKDIR $APP_DATA_FOLDER

EXPOSE 8080

ENTRYPOINT ["catalina.sh", "run"]