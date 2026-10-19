
# Smart Lost & Found Recovery System

A web application that helps people report lost items, find reported belongings, and connect with people who may have found them.

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS

**Backend**
- Java 21
- Spring Boot
- Spring Security
- JWT Authentication
- MySQL

## Getting Started

### 1. Run the Frontend

Open PowerShell and run:

```powershell
cd "d:\Smart Lost and Found Recovery System\frontend"; node .\node_modules\vite\bin\vite.js
```

Open the application in your browser:

http://localhost:5173

**Note:** Keep the terminal open while using the application.

### 2. Run the Backend (Optional)

Open another PowerShell terminal and run:

```powershell
cd "d:\Smart Lost and Found Recovery System\backend"
mvn spring-boot:run
```

Backend URL:

http://localhost:8080

If Swagger is configured, API documentation may be available at:

http://localhost:8080/swagger-ui/index.html

## Key Features

- Report lost items
- Report found items
- Browse and search item listings
- User authentication
- Connect lost-item reports with found-item reports
- Manage item information

*Available features depend on the current project implementation.*

## Project Structure

```text
Smart Lost and Found Recovery System/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   └── pom.xml
│
└── README.md
```

## Troubleshooting

- Make sure you run the command from the correct project directory.
- If the frontend does not start, check that the `frontend/node_modules` folder exists.
- If the backend fails to start, verify your Java and Maven installations.
- Make sure MySQL is running and the database configuration is correct if the backend requires it.

## License

This project is intended for learning and development purposes.
