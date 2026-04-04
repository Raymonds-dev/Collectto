import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { HashtagButton } from './HashtagButton';

export type ProfileHashtag = {
  label: string;
  count: number;
};

type ProfileHashtagFilterProps = {
  hashtags: ProfileHashtag[];
  onTagChange?: (tag: string | null) => void;
};

const ALL_TAG_LABEL = 'Todas';

export function ProfileHashtagFilter({ hashtags, onTagChange }: ProfileHashtagFilterProps) {
  const [selectedTag, setSelectedTag] = useState<string>(ALL_TAG_LABEL);

  const sortedTags = useMemo(() => {
    const tags = [...hashtags].sort((a, b) => b.count - a.count);
    return [{ label: ALL_TAG_LABEL, count: Number.POSITIVE_INFINITY }, ...tags];
  }, [hashtags]);

  function handleSelect(label: string) {
    setSelectedTag(label);

    if (label === ALL_TAG_LABEL) {
      onTagChange?.(null);
      return;
    }

    onTagChange?.(label);
  }

  return (
    <View className="mt-4 px-1">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row items-center gap-[10px] pr-[10px]">
          {sortedTags.map((tag) => (
            <HashtagButton
              key={`${tag.label}-${tag.count}`}
              label={tag.label}
              isSelected={selectedTag === tag.label}
              onPress={() => handleSelect(tag.label)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
