import { useHome } from '../../hooks/use-home';
import { Component } from '@angular/core';
import { SafeAreaView, ScrollView, Text, View } from '@ng-native/components';
import { Button } from '@/shared/components/button/index';
import { Card } from '@/shared/components/card/index';
import { Typography } from '@/shared/components/typography/index';
@Component({
  selector: 'app-home-page',
  imports: [SafeAreaView, ScrollView, Text, View, Button, Card, Typography],
  templateUrl: './page.html',
  styles: `
    :host {
      flex: 1;
    }
  `,
})
export class HomePage {
  protected readonly home = useHome();
}
