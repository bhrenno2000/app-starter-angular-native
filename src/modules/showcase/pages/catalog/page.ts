import { Component } from '@angular/core';
import { SafeAreaView, ScrollView, View, Text } from '@ng-native/components';
import { Typography } from '@/shared/components/typography';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Card } from '@/shared/components/card';
import { useShowcase } from '../../hooks/use-showcase';
@Component({
  selector: 'app-showcase-catalog-page',
  imports: [SafeAreaView, ScrollView, View, Text, Typography, Button, Card, Input],
  templateUrl: './page.html',
  styles: ':host { flex: 1; }',
})
export class ShowcaseCatalogPage {
  protected readonly showcase = useShowcase();
}
