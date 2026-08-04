import { BaseRepository } from './base.repository.js';

export class ProfilesRepository extends BaseRepository {
  constructor() {
    super('profiles');
  }
}

export const profilesRepository = new ProfilesRepository();
export default profilesRepository;
