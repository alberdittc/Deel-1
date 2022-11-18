const router = require('express').Router();
const controller = require('../controllers');
const { getProfileById } = require('../middleware/getProfile')

router.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

router.get(
  '/contracts/:id',
  getProfileById,
  (req, res) => {
    controller.getContractByProfileId(req, res);
  },
);

router.get(
  '/contracts',
  (req, res) => {
    controller.getActiveContracts(req, res);
  },
);

router.get(
  '/jobs/unpaid',
  (req, res) => {
    controller.getUnpaidJobs(req, res);
  },
);

router.post(
  '/jobs/:job_id/pay',
  (req, res) => {
    controller.updateTransactionJob(req, res);
  },
);

module.exports = router;
