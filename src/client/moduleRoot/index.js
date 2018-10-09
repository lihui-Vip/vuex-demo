import healthCare from './healthCare';
// import users from './users';
// import manage from './manage';
// import monitor from './monitor';

export default {
  path: '/',
  component: resolve => import('./main').then(resolve),
  // children: [users, monitor, toll, manage],
  children: [healthCare],
};
