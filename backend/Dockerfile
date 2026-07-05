FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["StudyHub.sln", "./"]
COPY ["StudyHub.API/StudyHub.API.csproj", "StudyHub.API/"]

# Restore dependencies
RUN dotnet restore "StudyHub.API/StudyHub.API.csproj"

# Copy all the source code
COPY . .

# Build and Publish
WORKDIR "/src/StudyHub.API"
RUN dotnet publish "StudyHub.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose port 8080 (default for Render web services and many platforms)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "StudyHub.API.dll"]
