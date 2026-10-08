import app from './app';
import { env } from './config/env';

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});
