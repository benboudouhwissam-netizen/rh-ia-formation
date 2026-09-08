import { Injectable } from '@nestjs/common';
import { Client } from 'minio';

const BUCKET = process.env.MINIO_BUCKET ?? 'rh-certificates';

@Injectable()
export class MinioService {
  private readonly client = new Client({
    endPoint: process.env.MINIO_ENDPOINT ?? 'localhost',
    port: Number(process.env.MINIO_PORT ?? 9000),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY ?? 'rhia_admin',
    secretKey: process.env.MINIO_SECRET_KEY ?? 'rhia_dev_password',
  });

  async uploadCertificate(key: string, content: Buffer) {
    const exists = await this.client.bucketExists(BUCKET).catch(() => false);
    if (!exists) await this.client.makeBucket(BUCKET);
    await this.client.putObject(BUCKET, key, content, content.length, { 'Content-Type': 'application/pdf' });
    return key;
  }

  async getCertificate(key: string) {
    const stream = await this.client.getObject(BUCKET, key);
    const chunks: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
