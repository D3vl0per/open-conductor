

SET sql_safe_updates = FALSE;

USE defaultdb;
DROP DATABASE IF EXISTS conductor CASCADE;
CREATE DATABASE IF NOT EXISTS conductor;
USE conductor;

CREATE TABLE IF NOT EXISTS "teams" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
	"name" varchar NOT NULL UNIQUE, 
	"allPlayer" int NOT NULL DEFAULT 3, 
	"timestamp" TIMESTAMPTZ DEFAULT current_timestamp(),
	PRIMARY KEY(id)
	);
	
CREATE TABLE IF NOT EXISTS "users" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
	"team" UUID,"firstname" varchar NOT NULL,
	"lastname" varchar NOT NULL,
	"email" varchar NOT NULL,"username" varchar,
	"userid" varchar UNIQUE,
	"code" UUID NOT NULL DEFAULT gen_random_uuid(),
	"joined" bool DEFAULT False,
	"supportban" bool DEFAULT False,
	"timestamp" TIMESTAMPTZ DEFAULT current_timestamp(),
	PRIMARY KEY(id),
	CONSTRAINT fk_teams FOREIGN KEY (team) REFERENCES teams(id) ON DELETE SET NULL
	);
	
CREATE TABLE IF NOT EXISTS "tickets" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
	"slot" int DEFAULT NULL,
	"opener" UUID,
	"problem" varchar NOT NULL,
	"open" bool DEFAULT True,
	"solved" bool DEFAULT False,
	"timestamp" TIMESTAMPTZ DEFAULT current_timestamp(),
	PRIMARY KEY(id),
	CONSTRAINT fk_users FOREIGN KEY (opener) REFERENCES users(id) ON DELETE SET NULL
	);
	
CREATE TABLE IF NOT EXISTS "logs" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY UNIQUE,
	"username" varchar NOT NULL,
	"userid" varchar NOT NULL,
	"command" varchar NOT NULL,
	"subcommand" varchar,
	"parameters" varchar,
	"timestamp" TIMESTAMPTZ DEFAULT current_timestamp()
	);

CREATE TABLE IF NOT EXISTS "flags" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    "flag" varchar NOT NULL UNIQUE,
	"score" int NOT NULL,
	"timestamp" TIMESTAMPTZ DEFAULT current_timestamp(),
	PRIMARY KEY(id)
	);

CREATE TABLE IF NOT EXISTS "submissions" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
	"team" UUID,
	"submission" varchar NOT NULL,
	"userid" varchar,
	"timestamp" TIMESTAMPTZ DEFAULT current_timestamp(),
	PRIMARY KEY(id),
	CONSTRAINT fk_teams FOREIGN KEY (team) REFERENCES teams(id) ON DELETE SET NULL,
	CONSTRAINT fk_users FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE SET NULL
	);

CREATE TABLE IF NOT EXISTS "scores" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
	"team" UUID,
	"submission" UUID,
	"flag" UUID,
	"timestamp" TIMESTAMPTZ DEFAULT current_timestamp(),
	PRIMARY KEY(id),
	UNIQUE(team, flag),
	CONSTRAINT fk_teams FOREIGN KEY (team) REFERENCES teams(id) ON DELETE SET NULL,
	CONSTRAINT fk_submissions FOREIGN KEY (submission) REFERENCES submissions(id) ON DELETE SET NULL,
	CONSTRAINT fk_flags FOREIGN KEY (flag) REFERENCES flags(id) ON DELETE SET NULL
	);