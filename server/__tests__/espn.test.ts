import fs from 'fs';
import * as espn from '../services/espn';

const readSpy = jest.spyOn(fs, 'readFileSync');
const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined as any);

function mockTokenFile(store: object | null) {
  if (store === null) {
    readSpy.mockImplementation(() => { throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' }); });
  } else {
    readSpy.mockReturnValue(JSON.stringify(store) as any);
  }
}

afterEach(() => {
  readSpy.mockReset();
  writeSpy.mockReset();
  writeSpy.mockImplementation(() => undefined as any);
});

describe('isAuthenticated', () => {
  it('returns false when token file does not exist', () => {
    mockTokenFile(null);
    expect(espn.isAuthenticated()).toBe(false);
  });

  it('returns true once credentials are stored', () => {
    mockTokenFile({ swid: '{ABC}', espnS2: 'tok', leagueId: '1', teamId: '2', seasonId: '2026' });
    expect(espn.isAuthenticated()).toBe(true);
  });
});

describe('setCredentials', () => {
  it('merges new credentials into any existing store', () => {
    mockTokenFile({ swid: '{OLD}', espnS2: 'old', leagueId: '1', teamId: '2', seasonId: '2025', pushToken: 'keep-me' });

    espn.setCredentials({ swid: '{NEW}', espnS2: 'new', leagueId: '1', teamId: '2', seasonId: '2026' });

    expect(writeSpy).toHaveBeenCalled();
    const written = JSON.parse((writeSpy.mock.calls[0] as any[])[1]);
    expect(written.swid).toBe('{NEW}');
    expect(written.seasonId).toBe('2026');
    expect(written.pushToken).toBe('keep-me');
  });
});

describe('savePushToken / getPushToken', () => {
  it('stores push token into existing token store', () => {
    const store = { swid: '{ABC}', espnS2: 'tok', leagueId: '1', teamId: '2', seasonId: '2026' };
    mockTokenFile(store);

    espn.savePushToken('ExponentPushToken[test123]');

    expect(writeSpy).toHaveBeenCalled();
    const written = JSON.parse((writeSpy.mock.calls[0] as any[])[1]);
    expect(written.pushToken).toBe('ExponentPushToken[test123]');
  });

  it('getPushToken returns undefined when no store exists', () => {
    mockTokenFile(null);
    expect(espn.getPushToken()).toBeUndefined();
  });

  it('getPushToken returns stored token', () => {
    mockTokenFile({ swid: '{ABC}', espnS2: 'tok', leagueId: '1', teamId: '2', seasonId: '2026', pushToken: 'ExponentPushToken[abc]' });
    expect(espn.getPushToken()).toBe('ExponentPushToken[abc]');
  });
});

describe('getRoster / getMatchup / getAvailablePlayers', () => {
  it('throws a helpful error when not connected', async () => {
    mockTokenFile(null);
    await expect(espn.getRoster()).rejects.toThrow('Not connected to ESPN');
    await expect(espn.getMatchup()).rejects.toThrow('Not connected to ESPN');
    await expect(espn.getAvailablePlayers()).rejects.toThrow('Not connected to ESPN');
  });
});
