"use client";
import React, { useEffect, useState } from 'react';
import SubjectsManager from '@/components/academics/SubjectsManager';

export default function SubjectsPage() {
  return (
    <div className="p-4 md:p-8">
      <SubjectsManager />
    </div>
  );
}