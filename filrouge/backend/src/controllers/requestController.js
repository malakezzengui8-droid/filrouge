import * as requestService from "../services/requestService.js";

// POST /api/requests
async function publish(req, res, next) {
  try {
    const request = await requestService.publishRequest(req.user.id, req.body);
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
}

// GET /api/requests?city=&bloodType=
async function getAll(req, res, next) {
  try {
    const { city, bloodType } = req.query;
    const requests = await requestService.getActiveRequests({
      city,
      bloodType,
    });
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
}

// GET /api/requests/:id
async function getOne(req, res, next) {
  try {
    const request = await requestService.getRequestById(req.params.id);
    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
}

// PUT /api/requests/:id/status
async function updateStatus(req, res, next) {
  try {
    const request = await requestService.updateRequestStatus(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.status,
    );
    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
}

// GET /api/requests/:id/compatible-donors
async function getCompatibleDonors(req, res, next) {
  try {
    // console.log("************* get user id **************");
    // console.log(req.user);
    // console.log("************* get user id **************");
    const userId = req.user.id;
    const donors = await requestService.findCompatibleDonors(
      req.params.id,
      userId,
    );
    res.status(200).json(donors);
  } catch (error) {
    next(error);
  }
}
// GET /api/requests/me
async function getMine(req, res, next) {
  try {
    const requests = await requestService.getMyRequests(req.user.id);
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
}

export { publish, getAll, getOne, updateStatus, getCompatibleDonors, getMine };
