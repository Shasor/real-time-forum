FROM golang:1.24-alpine3.20
RUN go install github.com/air-verse/air@latest

RUN apk add --no-cache sqlite gcc musl-dev git
ENV CGO_ENABLED=1

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .

EXPOSE 8080

CMD ["air"]
