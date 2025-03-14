import { debounce } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLikeList } from '../../../apis/user';
import cover from '../../../assets/images/song.png';
import { usePlayerManager } from '../../../context/PlayerContext';
import { usePlayerStore } from '../../../store/player';
import { useSettingStore } from '../../../store/setting';
import { useUserStore } from '../../../store/user';
import { eventBus } from '../../../utils/EventBus';
import { toLikeSong } from '../../../utils/song';
import Progress from '../../atoms/Progress';
import Modal from '../../numerator/Modal';
import Popover from '../../numerator/Popover';
import LryicModal from './Lyric';
import PlayList from './PlayerList';
import styles from './PlayBar.module.scss';

interface PlayBarProps {
	className?: string;
}

const PlayBar: React.FC<PlayBarProps> = ({ className }) => {
	const usePlayer = usePlayerManager();
	const navigate = useNavigate();

	const [playerListModalOpen, setPlayerListModalOpen] = useState(false);
	const [lyricModalOpen, setLyricModalOpen] = useState(false);

	const volumeRef = useRef<HTMLSpanElement>(null);
	const [seekDragging, setSeekDragging] = useState(false);

	const [currentSong, setCurrentSong] = useState(usePlayer.currentSong);
	const [mode, setMode] = useState(usePlayer.mode);
	const [playing, setPlaying] = useState(usePlayer.playing);
	const [muted, setMuted] = useState(usePlayer.muted);
	const [volume, setVolume] = useState(usePlayer.volume);
	const [seek, setSeek] = useState(usePlayer.seek);
	const [duration, setDuration] = useState(usePlayer.duration);
	const [lyrics, setLyrics] = useState<string | null>(null);

	const { likeSongs } = useUserStore.getState();
	const isLikeSong = (): boolean => {
		return likeSongs.ids?.includes(currentSong?.id ?? 0) ?? false;
	};

	const handleLike = () => {
		toLikeSong(currentSong?.id ?? 0, !isLikeSong());
	};

	useEffect(() => {
		usePlayer.resetPlaylistIndices();
		getLikeList();
	}, []);

	const updateState = useCallback(() => {
		setCurrentSong(usePlayer.currentSong);
		setMode(usePlayer.mode);
		setMuted(usePlayer.muted);
		setVolume(usePlayer.volume);
		if (!seekDragging) {
			setSeek(usePlayer.seek);
		}
		setDuration(usePlayer.duration);
		setPlaying(usePlayer.playing);
	}, [usePlayer, seekDragging]);

	useEffect(() => {
		updateState();
		const interval = setInterval(updateState, 250);
		return () => clearInterval(interval);
	}, [updateState]);

	const handleLyricsUpdate = useCallback(() => {
		if (useSettingStore.getState().showLyrics) {
			eventBus.emit(
				'playerLyricChange',
				usePlayer.currentLyric(useSettingStore.getState().lyricsType)
			);
			setLyrics(usePlayer.currentLyric(useSettingStore.getState().lyricsType));
		} else {
			setLyrics(null);
			eventBus.emit('playerLyricChange', lyrics);
		}
	}, [currentSong, useSettingStore.getState().showLyrics, seek]);

	useEffect(() => {
		handleLyricsUpdate();
	}, [handleLyricsUpdate]);

	const updateSeek = useCallback(async () => {
		if (useSettingStore.getState().savePlaySeek) usePlayerStore.setState({ seek });
		setPlaying(usePlayer.playing);
	}, [seek, usePlayer]);

	useEffect(() => {
		updateSeek();
	}, [updateSeek]);

	useEffect(() => {
		const emitLyricsChange = async () => {
			eventBus.emit('playerLyricChange', lyrics);
		};
		emitLyricsChange();
	}, [lyrics]);

	return (
		<>
			<div className={`${className || ''} ${styles.playbar}`.trim()}>
				<div className={styles.playbar__left}>
					<div className={styles.playbar__left__info}>
						<div className={styles.playbar__left__info__cover}>
							<img
								src={currentSong?.cover || cover}
								alt={`${currentSong?.name}的封面`}
							/>
							<div
								className={styles.playbar__left__info__cover__mask}
								onClick={() => setLyricModalOpen(true)}
							>
								<span className="i-solar-maximize-linear" />
							</div>
						</div>
						<div className={styles.playbar__left__info__text}>
							<h1 id="title">{currentSong?.name}</h1>
							<h2>
								{!lyrics
									? currentSong.artists?.map((artist) => artist).join('/')
									: lyrics}
							</h2>
						</div>
					</div>
					<div className={styles.action}>
						<span
							onClick={() => handleLike()}
							className={
								isLikeSong()
									? 'i-solar-heart-broken-line-duotone'
									: 'i-solar-heart-angle-line-duotone ${styles.like}'
							}
						/>
						<span
							onClick={() => navigate('/comment/song/' + currentSong.id)}
							className="i-solar-dialog-2-line-duotone"
						/>
						<span className="i-solar-menu-dots-circle-line-duotone" />
					</div>
				</div>
				<div className={styles.playbar__control}>
					<div className={styles.buttons}>
						<span
							className={`
								${mode === 'list' ? 'i-solar-repeat-line-duotone' : ''}
								${mode === 'random' ? 'i-solar-shuffle-line-duotone' : ''}
								${mode === 'single' ? 'i-solar-repeat-one-line-duotone' : ''}
							`}
							onClick={() =>
								debounce(() => {
									const newMode =
										mode === 'list'
											? 'random'
											: mode === 'random'
												? 'single'
												: 'list';
									usePlayer.mode = newMode;
								}, 300)()
							}
						/>
						<span
							className="i-solar-rewind-back-line-duotone"
							onClick={() => usePlayer.prev()}
						/>
						<span
							className={`
				${playing ? 'i-solar-pause-line-duotone' : 'i-solar-play-line-duotone'}
				`}
							onClick={() => {
								if (playing) return usePlayer.pause();
								usePlayer.play();
							}}
						/>
						<span
							className="i-solar-rewind-forward-line-duotone"
							onClick={() =>
								debounce(() => {
									usePlayer.next();
								}, 300)()
							}
						/>
						<span
							className={`
								${muted ? 'i-solar-muted-line-duotone' : ''}
								${volume < 0.25 ? 'i-solar-volume-line-duotone' : ''}
								${volume < 0.75 ? 'i-solar-volume-small-line-duotone' : ''}
								${volume >= 0.75 ? 'i-solar-volume-loud-line-duotone' : ''}
							`}
							onClick={() =>
								debounce(() => {
									usePlayer.muted = !usePlayer.muted;
								}, 300)()
							}
							ref={volumeRef}
							title={'当前音量：' + volume * 100 + '%，点击静音/取消静音'}
						/>
					</div>
					<div className={styles.progress}>
						<span>
							{`${Math.floor(seek / 60)
								.toString()
								.padStart(2, '0')}:${Math.floor(seek % 60)
								.toString()
								.padStart(2, '0')}`}
						</span>
						<Progress
							max={duration}
							value={seek}
							onMouseDown={() => setSeekDragging(true)}
							onMouseUp={() => {
								setSeekDragging(false);
								usePlayer.seek = seek; // 更新播放器的 seek 值
							}}
							onInput={(e) => {
								if (seekDragging) {
									const newSeek = Number((e?.target as HTMLInputElement).value);
									setSeek(newSeek); // 实时更新 seek 值
								}
							}}
						/>
						<span>
							{`${Math.floor(duration / 60)
								.toString()
								.padStart(2, '0')}:${Math.floor(duration % 60)
								.toString()
								.padStart(2, '0')}`}
						</span>
					</div>
				</div>
				<div className={styles.playbar__list}>
					<span
						className="i-solar-hamburger-menu-line-duotone"
						onClick={() => debounce(() => setPlayerListModalOpen(true), 300)()}
					/>
				</div>
			</div>
			<Popover
				listen={volumeRef}
				onClose={() => {
					/* 关闭逻辑 */
				}}
				className={styles.volume__popover}
			>
				<input
					type="range"
					min={0}
					max={1}
					step={0.01}
					value={volume}
					onChange={(e) => {
						const newVolume = Number(e.target.value);
						usePlayer.volume = newVolume;
					}}
				/>
				<span>
					{`${Math.floor(volume * 100)
						.toString()
						.padStart(2, '0')}%`}
				</span>
			</Popover>
			<Modal
				isOpen={playerListModalOpen}
				hasCard={false}
				onClose={() => setPlayerListModalOpen(false)}
				style={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
			>
				<PlayList onClose={() => setPlayerListModalOpen(false)} />
			</Modal>
			<Modal
				isOpen={lyricModalOpen}
				hasCard={false}
				onClose={() => setLyricModalOpen(false)}
				className={styles.lyric__modal}
				style={{ background: `url(${currentSong?.cover})` }}
			>
				<LryicModal onClose={() => setLyricModalOpen(false)} />
			</Modal>
		</>
	);
};

export default PlayBar;
