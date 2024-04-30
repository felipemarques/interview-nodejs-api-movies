# MoviesList API

## Description

This is an API project to manage a list of movies.

NodeJS version
```bash
v18.19.0
```

## Database Configuration

To run H2, the Java JRE needs to be installed. For example, on debian-like systems we can do:
```bash
apt install openjdk-11-jre
```

And run the database server with:
```bash
java -cp ./h2-2.2.224.jar org.h2.tools.Server -tcp -tcpAllowOthers -tcpPort 5234 -baseDir ./ -ifNotExists
```

## Installation and Execution

To install the project dependencies, use the following command:
```bash
npm install
```

To start the application in development mode, run:
```bash
npm run dev
```

This command will start the development server using TypeScript. The API will be available at http://localhost:5000.