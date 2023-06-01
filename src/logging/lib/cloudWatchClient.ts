import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { env } from "@src/commons/utils/readEnv";

const cloudWatchClient = new CloudWatchLogsClient({
  region: env.CLOUDWATCH_AWS_REGION,
  credentials: {
    accessKeyId: env.CLOUDWATCH_ACCESS_KEY,
    secretAccessKey: env.CLOUDWATCH_SECRET,
  },
});

export { cloudWatchClient };