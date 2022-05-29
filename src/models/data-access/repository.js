class Repository {
  constructor(model) {
    this.model = model;
  }

  /**
     *
     * @param document
     * @returns {Promise<document>}
     */
  async createOne(document) {
    return this.model.create(document);
  }

  /**
     *
     * @param whereClause
     * @param document
     * @returns {Promise<Query|*>}
     */
  async updateOne(whereClause = {}, document) {
    return this.model.updateOne(whereClause, document);
  }

  /**
     *
     * @param whereClause
     * @param projection
     * @returns {Promise<*>}
     */
  async findOne(whereClause = {}, projection = {}) {
    return this.model.findOne(whereClause, projection);
  }

  /**
     *
     * @param whereClause
     * @param projection
     * @returns {Promise<*>}
     */
  async findAll(whereClause = {}, projection = {}) {
    return this.model.findAll(whereClause, projection);
  }

  /**
     *
     * @param whereClause
     * @param projection
     * @returns {Promise<*>}
     */
  async deleteOne(whereClause = {}) {
    return this.model.updateOne(whereClause, { $set: { isDeleted: true } });
  }

  /**
     *
     * @param pipeline
     * @returns {Array<document>}
     */
  async aggregate(pipeline = []) {
    return this.model.aggregate(pipeline);
  }
}

module.exports = Repository;
