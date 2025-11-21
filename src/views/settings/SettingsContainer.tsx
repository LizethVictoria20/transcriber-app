
import React, { useState } from 'react';
import SettingsMenu from './SettingsMenu';
import MetricsView from './subviews/MetricsView';
import ApiSettingsView from './subviews/ApiSettingsView';
import PromptSettingsView from './subviews/PromptSettingsView';
import AlertsView from './subviews/AlertsView';
import SotView from './subviews/SotView';
import SystemPreferencesView from './subviews/SystemPreferencesView';
import type { SettingsViewType, TranscriptionItem, ApiKeys, Prompts, AlertSettings, SotSettings, SystemPreferences } from '../../types';

interface SettingsContainerProps {
    theme: string;
    setTheme: (theme: string) => void;
    transcriptions: TranscriptionItem[];
    apiKeys: ApiKeys;
    setApiKeys: (keys: ApiKeys) => void;
    prompts: Prompts;
    setPrompts: (prompts: Prompts) => void;
    alertSettings: AlertSettings;
    setAlertSettings: (settings: AlertSettings) => void;
    sotSettings: SotSettings;
    setSotSettings: (settings: SotSettings) => void;
    systemPreferences: SystemPreferences;
    setSystemPreferences: (prefs: SystemPreferences) => void;
}

export default function SettingsContainer(props: SettingsContainerProps) {
    const [activeView, setActiveView] = useState<SettingsViewType>('main');

    switch(activeView) {
        case 'metrics':
            return <MetricsView transcriptions={props.transcriptions} setSettingsView={setActiveView} />;
        case 'api':
            return <ApiSettingsView apiKeys={props.apiKeys} setApiKeys={props.setApiKeys} setSettingsView={setActiveView} />;
        case 'prompts':
            return <PromptSettingsView prompts={props.prompts} setPrompts={props.setPrompts} setSettingsView={setActiveView} />;
        case 'alerts':
            return <AlertsView setSettingsView={setActiveView} alertSettings={props.alertSettings} setAlertSettings={props.setAlertSettings} />;
        case 'sot':
            return <SotView setSettingsView={setActiveView} sotSettings={props.sotSettings} setSotSettings={props.setSotSettings} />;
        case 'systemPrefs':
            return <SystemPreferencesView setSettingsView={setActiveView} preferences={props.systemPreferences} setPreferences={props.setSystemPreferences} />;
        case 'main':
        default:
            return <SettingsMenu setSettingsView={setActiveView} theme={props.theme} setTheme={props.setTheme} />;
    }
}
