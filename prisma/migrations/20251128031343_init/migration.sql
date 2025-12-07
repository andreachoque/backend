-- DropIndex
DROP INDEX "Usuario_email_rol_idx";

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_rol_idx" ON "Usuario"("rol");
