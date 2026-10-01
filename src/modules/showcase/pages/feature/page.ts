import { NativeGesture } from '@ng-native/components/gestures';
import { WorkletStyle } from '@ng-native/components/reanimated';
import { AnimatedStyle } from '@ng-native/components/animations';
import { NativeMap } from '@/shared/components/native-map';
import { NativeWebView } from '@/shared/components/native-web-view';
import { NativeCamera } from '@/shared/components/native-camera';
import { NativeVideo } from '@/shared/components/native-video';
import { Component } from '@angular/core';
import { SafeAreaView, ScrollView, View, Text, Image } from '@ng-native/components';
import { Typography } from '@/shared/components/typography';
import { Button } from '@/shared/components/button';
import { Card } from '@/shared/components/card';
import { useShowcaseFeature } from '../../hooks/use-showcase-feature';
@Component({
  selector: 'app-showcase-feature-page',
  imports: [
    NativeGesture,
    WorkletStyle,
    AnimatedStyle,
    NativeMap,
    NativeWebView,
    NativeCamera,
    NativeVideo,
    SafeAreaView,
    ScrollView,
    View,
    Text,
    Image,
    Typography,
    Button,
    Card,
  ],
  templateUrl: './page.html',
  styles: ':host { flex: 1; }',
})
export class ShowcaseFeaturePage {
  protected readonly showcase = useShowcaseFeature();
}
