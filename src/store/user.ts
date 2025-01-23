import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailySongsResult } from '../models/song';

/**
 * 系统设置store类型
 */
export interface userStoreType {
	dailySong: { timestamp: number; tracks: DailySongsResult | null };
	setDailySong: (dailySong: { timestamp: number; tracks: DailySongsResult }) => void;
}

export const useUserStore = create(
	persist<userStoreType>(
		(set) => ({
			dailySong: { timestamp: 0, tracks: null },
			setDailySong: (dailySong) => set(() => ({ dailySong })),
		}),
		{
			name: 'user-storage',
		}
	)
);
