-- CreateTable
CREATE TABLE "teams" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "athena_api_token" TEXT NOT NULL,
    "athena_brain_id" UUID,
    "team_id" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id","team_id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "team_id" TEXT,
    "chat_id" UUID,
    "thread_id" TEXT,
    "athena_brain_id" UUID,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Installation" (
    "id" SERIAL NOT NULL,
    "installationId" TEXT NOT NULL,
    "installationType" TEXT NOT NULL,
    "enterpriseId" TEXT,
    "teamId" TEXT,
    "installationData" JSONB NOT NULL,

    CONSTRAINT "Installation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_team_id_key" ON "teams"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "Installation_installationId_key" ON "Installation"("installationId");

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE NO ACTION ON UPDATE CASCADE;
