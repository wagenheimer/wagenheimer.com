# Use the official .NET 8 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release

# Install Node.js (Required for Tailwind CSS)
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

WORKDIR /src

# Copy project files and restore dependencies
COPY ["WagenheimerDotCom/WagenheimerDotCom.csproj", "WagenheimerDotCom/"]
COPY ["WagenheimerDotCom.Client/WagenheimerDotCom.Client.csproj", "WagenheimerDotCom.Client/"]

RUN dotnet restore "WagenheimerDotCom/WagenheimerDotCom.csproj"

# Copy the remaining source code
COPY . .

# Build the application
WORKDIR "/src/WagenheimerDotCom"
RUN dotnet build "WagenheimerDotCom.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish the application
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "WagenheimerDotCom.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WagenheimerDotCom.dll"]
