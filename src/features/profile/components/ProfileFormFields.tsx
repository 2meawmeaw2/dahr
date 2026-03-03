import { Input, Badge } from '../../../components/ui';
import type {
  EquipmentType,
  ExperienceLevel,
  GoalType,
  ProfileDraft
} from '../types';
import type { ProfileValidationErrors } from '../validation';
import { useTheme } from '../../../theme';

const prettify = (value: string): string => value.replace('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

type OptionGroupProps<T extends string> = {
  title: string;
  options: readonly T[];
  value: T | T[];
  onChange: (next: T) => void;
  multi?: boolean;
};

const OptionGroup = <T extends string>({ title, options, value, onChange, multi = false }: OptionGroupProps<T>) => {
  const theme = useTheme();

  return (
    <div style={{ display: 'grid', gap: theme.spacing.xs }}>
      <strong style={{ fontSize: 14 }}>{title}</strong>
      <div style={{ display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
        {options.map((option) => {
          const selected = Array.isArray(value) ? value.includes(option) : value === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={selected}
              style={{
                border: 'none',
                padding: 0,
                background: 'none',
                cursor: 'pointer',
              }}
            >
              <Badge tone={selected ? 'accent' : 'neutral'}>{prettify(option)}</Badge>
            </button>
          );
        })}
      </div>
      {multi ? <small>Select all that apply.</small> : null}
    </div>
  );
};

type ProfileFormFieldsProps = {
  draft: ProfileDraft;
  errors: ProfileValidationErrors;
  onDraftChange: (updates: Partial<ProfileDraft>) => void;
  goalOptions: readonly GoalType[];
  experienceOptions: readonly ExperienceLevel[];
  equipmentOptions: readonly EquipmentType[];
};

export const ProfileFormFields = ({
  draft,
  errors,
  onDraftChange,
  goalOptions,
  experienceOptions,
  equipmentOptions,
}: ProfileFormFieldsProps) => {
  const theme = useTheme();

  return (
    <div style={{ display: 'grid', gap: theme.spacing.md }}>
      <label style={{ display: 'grid', gap: theme.spacing.xs }}>
        <strong>Full name</strong>
        <Input
          value={draft.fullName}
          invalid={Boolean(errors.fullName)}
          placeholder="Your name"
          onChange={(event) => onDraftChange({ fullName: event.target.value })}
        />
        {errors.fullName ? <small style={{ color: theme.colors.state.error }}>{errors.fullName}</small> : null}
      </label>

      <OptionGroup title="Primary goal" options={goalOptions} value={draft.goal} onChange={(goal) => onDraftChange({ goal })} />
      {errors.goal ? <small style={{ color: theme.colors.state.error }}>{errors.goal}</small> : null}

      <OptionGroup
        title="Experience level"
        options={experienceOptions}
        value={draft.experienceLevel}
        onChange={(experienceLevel) => onDraftChange({ experienceLevel })}
      />
      {errors.experienceLevel ? <small style={{ color: theme.colors.state.error }}>{errors.experienceLevel}</small> : null}

      <OptionGroup
        title="Available equipment"
        options={equipmentOptions}
        value={draft.equipment}
        multi
        onChange={(equipmentValue) => {
          const has = draft.equipment.includes(equipmentValue);
          const equipment = has
            ? draft.equipment.filter((item) => item !== equipmentValue)
            : [...draft.equipment, equipmentValue];

          onDraftChange({ equipment });
        }}
      />
      {errors.equipment ? <small style={{ color: theme.colors.state.error }}>{errors.equipment}</small> : null}

      <label style={{ display: 'grid', gap: theme.spacing.xs }}>
        <strong>Days available per week</strong>
        <Input
          type="number"
          min={1}
          max={7}
          value={draft.daysPerWeek}
          invalid={Boolean(errors.daysPerWeek)}
          onChange={(event) => onDraftChange({ daysPerWeek: Number(event.target.value) })}
        />
        {errors.daysPerWeek ? <small style={{ color: theme.colors.state.error }}>{errors.daysPerWeek}</small> : null}
      </label>

      <label style={{ display: 'grid', gap: theme.spacing.xs }}>
        <strong>Typical session duration (minutes)</strong>
        <Input
          type="number"
          min={15}
          max={180}
          step={5}
          value={draft.sessionDurationMinutes}
          invalid={Boolean(errors.sessionDurationMinutes)}
          onChange={(event) => onDraftChange({ sessionDurationMinutes: Number(event.target.value) })}
        />
        {errors.sessionDurationMinutes ? (
          <small style={{ color: theme.colors.state.error }}>{errors.sessionDurationMinutes}</small>
        ) : null}
      </label>

      <label style={{ display: 'grid', gap: theme.spacing.xs }}>
        <strong>Injury or limitation notes</strong>
        <Input
          value={draft.injuries}
          maxLength={240}
          invalid={Boolean(errors.injuries)}
          placeholder="e.g., prior ACL tear, wrist pain"
          onChange={(event) => onDraftChange({ injuries: event.target.value })}
        />
        {errors.injuries ? <small style={{ color: theme.colors.state.error }}>{errors.injuries}</small> : null}
      </label>

      <label style={{ display: 'grid', gap: theme.spacing.xs }}>
        <strong>Mobility constraints</strong>
        <Input
          value={draft.mobilityConstraints}
          maxLength={240}
          invalid={Boolean(errors.mobilityConstraints)}
          placeholder="e.g., limited overhead shoulder mobility"
          onChange={(event) => onDraftChange({ mobilityConstraints: event.target.value })}
        />
        {errors.mobilityConstraints ? (
          <small style={{ color: theme.colors.state.error }}>{errors.mobilityConstraints}</small>
        ) : null}
      </label>
    </div>
  );
};
