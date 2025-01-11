import React from 'react';
import styles from './Controls.module.scss';

interface ControlProps {
	label: string;
	children: React.ReactNode;
}

const Control: React.FC<ControlProps> = ({ label, children }) => {
	return (
		<div className={styles.control}>
			<label className={styles.label}>{label}</label>
			<div className={styles.input}>{children}</div>
		</div>
	);
};

interface CheckboxProps {
	value: boolean;
	onChange: (value: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ value, onChange }) => {
	return (
		<label className={styles.checkbox}>
			<input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
			<span className={styles.checkbox__checkmark}></span>
		</label>
	);
};

interface SelectProps {
	options: { value: string; label: string }[];
	value: string;
	onChange: (value: any) => void;
}

export const Select: React.FC<SelectProps> = ({ options, value, onChange }) => {
	return (
		<select className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
};

export default Control;
