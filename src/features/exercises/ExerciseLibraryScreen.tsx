import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { spacing } from '@/theme/tokens';

import { exerciseLibrary, movementCategories, skillTags } from './exercisesData';
import { Exercise, MovementCategory } from './models';

function TagPill({ label, active, onPress, disabled = false }: { label: string; active: boolean; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? '#1D4ED8' : '#CBD5E1',
        backgroundColor: active ? '#DBEAFE' : '#FFFFFF',
      }}
    >
      <Text style={{ color: active ? '#1E3A8A' : '#334155', fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

function ProgressionTree({ exercise }: { exercise: Exercise }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={{ fontWeight: '700', color: '#0F172A' }}>Progression Tree</Text>
      <View style={{ gap: 4 }}>
        <Text style={{ color: '#475569' }}>Regression</Text>
        <Text style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#E2E8F0' }}>{exercise.progression.regression}</Text>
      </View>
      <Text style={{ color: '#94A3B8', fontWeight: '700' }}>↓</Text>
      <View style={{ gap: 4 }}>
        <Text style={{ color: '#475569' }}>Base</Text>
        <Text style={{ backgroundColor: '#EFF6FF', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#93C5FD' }}>{exercise.progression.base}</Text>
      </View>
      <Text style={{ color: '#94A3B8', fontWeight: '700' }}>↓</Text>
      <View style={{ gap: 4 }}>
        <Text style={{ color: '#475569' }}>Progression</Text>
        <Text style={{ backgroundColor: '#F0FDF4', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#86EFAC' }}>{exercise.progression.progression}</Text>
      </View>
    </View>
  );
}

export function ExerciseLibraryScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MovementCategory | 'all'>('all');
  const [selectedSkill, setSelectedSkill] = useState<'all' | (typeof skillTags)[number]>('all');

  const filteredExercises = useMemo(() => {
    return exerciseLibrary.filter((exercise) => {
      const matchesQuery =
        query.trim().length === 0 ||
        `${exercise.name} ${exercise.summary} ${exercise.tags.strength.join(' ')} ${exercise.tags.mobility.join(' ')}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());

      const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
      const matchesSkill = selectedSkill === 'all' || exercise.tags.skill.includes(selectedSkill);

      return matchesQuery && matchesCategory && matchesSkill;
    });
  }, [query, selectedCategory, selectedSkill]);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 26, fontWeight: '700' }}>Exercise Library</Text>
        <Text style={{ color: '#475569' }}>Search by movement pattern, filter by tags, and review progression paths with coaching notes.</Text>
      </View>

      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: spacing.md, gap: spacing.sm }}>
        <Text style={{ fontWeight: '600' }}>Search</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises, strength tags, or mobility focus"
          placeholderTextColor="#94A3B8"
          style={{
            borderWidth: 1,
            borderColor: '#CBD5E1',
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: '#F8FAFC',
            color: '#0F172A',
          }}
        />

        <Text style={{ fontWeight: '600', marginTop: 6 }}>Movement Category</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <TagPill label="All" active={selectedCategory === 'all'} onPress={() => setSelectedCategory('all')} />
          {movementCategories.map((category) => (
            <TagPill key={category} label={category} active={selectedCategory === category} onPress={() => setSelectedCategory(category)} />
          ))}
        </View>

        <Text style={{ fontWeight: '600', marginTop: 6 }}>Skill Tag</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <TagPill label="All" active={selectedSkill === 'all'} onPress={() => setSelectedSkill('all')} />
          {skillTags.map((skill) => (
            <TagPill key={skill} label={skill} active={selectedSkill === skill} onPress={() => setSelectedSkill(skill)} />
          ))}
        </View>
      </View>

      <Text style={{ color: '#334155', fontWeight: '600' }}>{filteredExercises.length} exercise(s) found</Text>

      {filteredExercises.map((exercise) => (
        <View key={exercise.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: spacing.md, gap: spacing.sm }}>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>{exercise.name}</Text>
            <Text style={{ color: '#475569' }}>{exercise.summary}</Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <TagPill label={`skill: ${exercise.tags.skill.join(', ') || 'none'}`} active={false} disabled onPress={() => {}} />
            <TagPill label={`strength: ${exercise.tags.strength.join(', ')}`} active={false} disabled onPress={() => {}} />
            <TagPill label={`mobility: ${exercise.tags.mobility.join(', ')}`} active={false} disabled onPress={() => {}} />
            <TagPill label={`equipment: ${exercise.tags.equipment.join(', ')}`} active={false} disabled onPress={() => {}} />
            <TagPill label={`level: ${exercise.tags.level}`} active={false} disabled onPress={() => {}} />
          </View>

          <ProgressionTree exercise={exercise} />

          <View style={{ gap: 4 }}>
            <Text style={{ fontWeight: '700', color: '#991B1B' }}>Contraindication Notes</Text>
            {exercise.contraindications.map((item) => (
              <Text key={item} style={{ color: '#7F1D1D' }}>• {item}</Text>
            ))}
          </View>

          <View style={{ gap: 4 }}>
            <Text style={{ fontWeight: '700', color: '#92400E' }}>Common Faults</Text>
            {exercise.commonFaults.map((fault) => (
              <Text key={fault} style={{ color: '#78350F' }}>• {fault}</Text>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
