import { BigQuery } from '@google-cloud/bigquery';

export const BIGQUERY_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
export const BIGQUERY_DATASET = process.env.BIGQUERY_DATASET ?? 'fantasy_engine';

export const bigquery = BIGQUERY_PROJECT_ID ? new BigQuery({ projectId: BIGQUERY_PROJECT_ID }) : null;

export function getBigQueryClient(): BigQuery {
  if (!bigquery) {
    throw new Error('GOOGLE_CLOUD_PROJECT is not set. Add it to your .env before using BigQuery.');
  }

  return bigquery;
}
