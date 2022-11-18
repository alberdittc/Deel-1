const { Contract, Profile, Job } = require('../model');
const Sequelize = require('sequelize');

const { Op } = Sequelize;

const getContractByProfileId = async (id) => {
  return Contract.findAll({
    where: {
      id
    },
    include: 
      [{ model: Profile,
        as: 'Client',
        }
        ,{
        model: Profile,
        as: 'Contractor'
      }]
    });
};

const getProfileById = async (id) => {
  return Profile.findOne({ where: { id: id || 0 } })
};

const getActiveContracts = async() => {
  return Contract.findAll({
    where: { status: { [Op.not]: ['terminated'] }},    
    include: 
      [{ model: Profile,
        as: 'Client',
        }
        ,{
        model: Profile,
        as: 'Contractor'
      }]
  });
};

const getUnpaidJobs = async() => {
  const unPaidJobs = await Job.findAll({
    where: { paid: { [Op.not]: true }},
    include: 
      [{ model: Contract,
        as: 'Contract',
        where: { status: { [Op.not]: ['terminated'] }},
        }
      ]
  });

  return unPaidJobs[0] // assume relation is one to one
};

const updateClientBalance = async(ClientId, price) => {
  const clientBalance = await Profile.increment( 'balance', {
    by: -price,
    where: { id: ClientId, balance: { [Op.gt]: price }},
  });

  return clientBalance[0][1]
};

const updateContractorBalance = async(ContractorId, price) => {
  const contractorBalance = await Profile.increment( 'balance', {
    by: +price,
    where: { id: ContractorId },
  });
  
  return contractorBalance[0][1]
};


const updateBulk = async(ClientId, ContractorId, price) => {
  const promises = Promise.all([updateClientBalance(ClientId, price),updateContractorBalance(ContractorId, price)]).then((values) => {
    return values;
  });

  return await promises
};

const rollbackClientTransaction = async(ClientId, price) => {
  const clientBalance = await Profile.increment( 'balance', {
    by: +price,
    where: { id: ClientId },
  });

  return clientBalance[0][1]
}

const rollbackContractorTransaction = async(ContractorId, price) => {
  const contractorBalance = await Profile.increment( 'balance', {
    by: -price,
    where: { id: ContractorId },
  });

  return contractorBalance[0][1]
}

const paybyJobId = async (ContractId) => {
  const job = await Job.findAll({
    where: { paid: { [Op.not]: true }, ContractId }
  });

  return job[0]
}

module.exports = {
  getContractByProfileId,
  getProfileById,
  getActiveContracts,
  getUnpaidJobs,
  updateClientBalance,
  updateContractorBalance,
  updateBulk,
  rollbackClientTransaction,
  rollbackContractorTransaction,
  paybyJobId
}