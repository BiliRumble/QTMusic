import { debounce } from 'lodash-es';
import { useEffect, useState } from 'react';
import { usePlayerManager } from '../../../../context/PlayerContext';
import { PlayList } from '../../../../models/song';
import LazyImage from '../../../atoms/LazyImage';
import styles from './PlayList.module.scss';

interface PlayListProps {
	onClose: () => void;
	className?: string;
	style?: React.CSSProperties;
}

const PlayListModal: React.FC<PlayListProps> = ({ onClose, className = '', style }) => {
	const usePlayer = usePlayerManager();
	const [playlist, setPlaylist] = useState<PlayList>({
		count: 0,
		data: [],
	});
	const [nowPlaying, setNowPlaying] = useState<number>(0);

	useEffect(() => {
		setPlaylist(usePlayer.playlist);
		setNowPlaying(usePlayer.currentSong.id);
	}, [usePlayer.playlist, usePlayer.currentSong]);

	return (
		<div className={styles.playlist + ' ' + className} style={style}>
			<div className={styles.playlist__header}>
				<h2>播放列表</h2>
				<span>
					{playlist.count}首 · <span onClick={() => usePlayer.clearPlaylist()}>清空</span>
				</span>
				<button className={styles.closeButton} onClick={onClose}>
					&times;
				</button>
			</div>
			<div className={styles.playlist__list}>
				{playlist.data.map((item) => (
					<div
						className={
							styles.playlist__list__item +
							(item.id === nowPlaying
								? ' ' + styles.playlist__list__item__active
								: '')
						}
						key={item.id}
					>
						<LazyImage
							src={item.cover || ''}
							alt={item.name}
							className={styles.playlist__list__item__cover}
						/>
						<div
							className={styles.playlist__list__item__info}
							onClick={() => {
								debounce(() => {
									usePlayer.setCurrentSong(item.id, true);
								}, 300)();
								onClose();
							}}
						>
							<h3 className={styles.playlist__list__item__name}>{item.name}</h3>
							<span className={styles.playlist__list__item__artist}>
								{item.artists}
							</span>
						</div>
						<span
							className={
								styles.playlist__list__item__delete + ' i-solar-trash-bin-2-linear'
							}
							onClick={() => usePlayer.removeFromPlaylist(item.id)}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default PlayListModal;
