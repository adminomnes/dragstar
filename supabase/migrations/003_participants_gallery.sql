-- 003_participants_gallery.sql
-- Añade columna para almacenar URLs de imágenes de la galería del participante

ALTER TABLE participants
ADD COLUMN gallery TEXT[] DEFAULT '{}' NOT NULL;
