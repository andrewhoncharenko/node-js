const http = require("http");
const fs = require("fs");

const processRequest = (request, response) => {
    const url = request.url;
    const method = request.method;

    response.setHeader("Content-Type", "text/html");
    if(request.url === "/") {
        response.write("<html>");
        response.write("<head><title>Enter message</title></head>");
        response.write("<body><form action=\"/message\" method=\"POST\"><input type=\"text\" name=\"message\"><button type=\"submit\">Send</button></form></body>");
        response.write("</html>");
        return response.end();
    }
    if(url === "/message" && method === "POST") {
        const body = [];
        request.on("data", (chunk) => {
            body.push(chunk);
        });
        request.on("end", () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split("=")[1];
            fs.writeFile("message.txt", message, error => {
                response.statusCode = 302;
                response.setHeader("Location", "/");
                return response.end();
            });
        });
    }
}

const server = http.createServer(processRequest);

server.listen(3000);