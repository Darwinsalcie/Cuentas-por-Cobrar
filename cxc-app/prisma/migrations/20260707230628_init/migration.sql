-- CreateTable
CREATE TABLE "TipoDocumento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descripcion" TEXT NOT NULL,
    "cuentaContable" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "limiteCredito" REAL NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Transaccion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipoMovimiento" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "monto" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tipoDocumentoId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    CONSTRAINT "Transaccion_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "TipoDocumento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaccion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AsientoContable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descripcion" TEXT NOT NULL,
    "cuenta" TEXT NOT NULL,
    "tipoMovimiento" TEXT NOT NULL,
    "fechaAsiento" DATETIME NOT NULL,
    "montoAsiento" REAL NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'REGISTRADO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clienteId" TEXT NOT NULL,
    CONSTRAINT "AsientoContable_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cedula_key" ON "Cliente"("cedula");
