import { z } from 'zod';

/**
 * Helpers reutilizáveis para schemas Zod
 * Úteis para lidar com retornos de APIs/Banco de Dados onde muitos campos são opcionais ou nulos
 */

// String que aceita texto, null ou undefined
export const nullishString = z.string().nullish();

// Número que aceita valor, null ou undefined
export const nullishNumber = z.number().nullish();

// Boolean que aceita valor, null ou undefined
export const nullishBoolean = z.boolean().nullish();

// Data/Timestamp (geralmente string na API) que aceita valor, null ou undefined
export const nullishDateString = z.string().nullish();

// Objeto vazio ou nulo (útil para campos de metadados)
export const nullishObject = z.record(z.string(), z.any()).nullish();

/**
 * Helper para criar um schema que aceita null ou undefined além do tipo base
 */
export const makeNullish = <T extends z.ZodTypeAny>(schema: T) => schema.nullish();
