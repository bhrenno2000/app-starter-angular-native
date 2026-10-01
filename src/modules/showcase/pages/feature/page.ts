import { NativeVideo } from '@/shared/components/native-video';
import { Component } from '@angular/core';
import { SafeAreaView, ScrollView, View, Text, Image } from '@ng-native/components';
import { Typography } from '@/shared/components/typography';
import { Button } from '@/shared/components/button';
import { Card } from '@/shared/components/card';
import { useShowcaseFeature } from '../../hooks/use-showcase';
@Component({
  selector: 'app-showcase-feature-page',
  imports: [NativeVideo, SafeAreaView, ScrollView, View, Text, Image, Typography, Button, Card],
  templateUrl: './page.html',
  styles: ':host { flex: 1; }',
})
export class ShowcaseFeaturePage {
  protected readonly showcase = useShowcaseFeature();
}
