
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SettingsMenu from './SettingsMenu';
import MetricsView from './subviews/MetricsView';
import ApiSettingsView from './subviews/ApiSettingsView';
import PromptSettingsView from './subviews/PromptSettingsView';
import AlertsView from './subviews/AlertsView';
import SotView from './subviews/SotView';
import SystemPreferencesView from './subviews/SystemPreferencesView';
import type { TranscriptionItem, ApiKeys, Prompts, AlertSettings, SotSettings, SystemPreferences } from '../../types';

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
    return (
        <Routes>
            <Route index element={<SettingsMenu theme={props.theme} setTheme={props.setTheme} />} />
            <Route path="metrics" element={<MetricsView transcriptions={props.transcriptions} />} />
            <Route path="api" element={<ApiSettingsView apiKeys={props.apiKeys} setApiKeys={props.setApiKeys} />} />
            <Route path="prompts" element={<PromptSettingsView prompts={props.prompts} setPrompts={props.setPrompts} />} />
            <Route path="alerts" element={<AlertsView alertSettings={props.alertSettings} setAlertSettings={props.setAlertSettings} />} />
            <Route path="sot" element={<SotView sotSettings={props.sotSettings} setSotSettings={props.setSotSettings} />} />
            <Route path="system-preferences" element={<SystemPreferencesView preferences={props.systemPreferences} setPreferences={props.setSystemPreferences} />} />
            <Route path="*" element={<Navigate to="/settings" replace />} />
        </Routes>
    );
}
