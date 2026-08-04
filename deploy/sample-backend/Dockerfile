ARG SAMPLE_JRE_IMAGE=mirror.ccs.tencentyun.com/library/eclipse-temurin:17-jre-jammy@sha256:279ba2190bde4ade8318e183016573dc293c2e5284eb265b191cdb80d62c6f4c
FROM ${SAMPLE_JRE_IMAGE}

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ca-certificates curl fontconfig fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 sample \
    && useradd --system --uid 10001 --gid sample --home-dir /ruoyi/server --shell /usr/sbin/nologin sample \
    && install -d -o sample -g sample /ruoyi/server/logs /ruoyi/server/temp

WORKDIR /ruoyi/server
COPY --chown=sample:sample backend.jar /ruoyi/server/app.jar

USER sample:sample
EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/ruoyi/server/app.jar"]
