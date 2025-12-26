# Use the official .NET 10 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release

# Install Node.js (Required for Tailwind CSS)
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

WORKDIR /src

# Copy solution and project files
COPY ["WagenheimerDotCom.sln", "."]
COPY ["WagenheimerDotCom/WagenheimerDotCom.csproj", "WagenheimerDotCom/"]
COPY ["WagenheimerDotCom.Client/WagenheimerDotCom.Client.csproj", "WagenheimerDotCom.Client/"]

# Restore dependencies
RUN dotnet restore

# Copy the remaining source code
COPY . .

# Build Tailwind CSS
WORKDIR "/src/WagenheimerDotCom"
RUN npm install
RUN npm run build:css

# Build the application
WORKDIR "/src/WagenheimerDotCom"
RUN dotnet build "WagenheimerDotCom.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish the application
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "WagenheimerDotCom.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WagenheimerDotCom.dll"]
