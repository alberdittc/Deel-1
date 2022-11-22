const repository = require('../db/repository')

const getContractByProfileId = async (req, res) => {
  const { id } = req.params
  try {
    const contracts = await repository.getContractByProfileId(id)
    if (contracts.length > 0) {
      res.status(200).send({ contracts })
    } else {
      res.status(204).end()
    }
  } catch (e) {
    res.status(500).send({ message: e.message })
  }
}

const getActiveContracts = async (req, res) => {
  try {
    const contracts = await repository.getActiveContracts()
    if (contracts.length > 0) {
      res.status(200).send({ contracts })
    } else {
      res.status(204).end()
    }
  } catch (e) {
    res.status(500).send({ message: e.message })
  }
}

const getUnpaidJobs = async (req, res) => {
  try {
    const contracts = await repository.getAllUnpaidJobs()
    if (contracts.length > 0) {
      res.status(200).send({ contracts })
    } else {
      res.status(204).end()
    }
  } catch (e) {
    res.status(500).send({ message: e.message })
  }
}

const updateTransactionJob = async (req, res) => {
  const { job_id } = req.params
  try {
    const contracts = await repository.getUnpaidJobs(job_id)
    if (!contracts.Contract) {
      return res.status(404).send({ message: `There is not any job with id ${job_id}` })
    }

    const { price } = contracts.toJSON()
    const { ClientId, ContractorId } = contracts.Contract.dataValues
    const balance = await repository.getClientBalance(ClientId)
    if (balance > price) {     
      const profilesBalance = await repository.updateBulk(ClientId, ContractorId, price) // it uses promises all
      if (profilesBalance[0] === 1 && profilesBalance[1] === 1) {
        
        return res.status(200).send({ message: `${price} pounds have been paid by the client id ${ClientId} to the contractor id ${ContractorId} for the job id ${job_id}` })
      } else if (!profilesBalance[0] && profilesBalance[1]) { // It means client did not have enough money so its need to return the money to the contractor
        await repository.rollbackContractorTransaction(ContractorId, price)

        return res.status(500).send({ message: `There was a problem in the transaction bettween client id ${ClientId} and contractor id ${ContractorId} for the job id ${job_id}` })
      } else if (profilesBalance[0] && !profilesBalance[1]) { // Its needs to return the money to the client, the contractor did not receive the money
        await repository.rollbackClientTransaction(ClientId, price)
        
        return res.status(500).send({ message: `There was a problem in the transaction bettween client id ${ClientId} and contractor id ${ContractorId} for the job id ${job_id}` })
      }
    } else {
      return res.status(201).send({ message: `The client id ${ClientId} does not have enough money to pay for the job id ${job_id} to the contractor id ${ContractorId}, a hitman is on his way` })
    }
  } catch (e) {
    return res.status(500).send({ message: e.message })
  }
}

module.exports = {
  getContractByProfileId,
  getActiveContracts,
  getUnpaidJobs,
  updateTransactionJob
}
