import mammoth from 'mammoth';
import { join } from 'path';

async function readTranscription() {
  try {
    const docxPath = join(import.meta.dir, 'transcription-one-page.docx');
    const result = await mammoth.extractRawText({ path: docxPath });
    return result.value;
  } catch (error) {
    console.error('Error reading transcription file:', error);
    return null;
  }
}

async function main() {
  const isAiTesting = process.argv.includes('--ai-testing');
  
  if (isAiTesting) {
    console.log('🤖 AI Internal Testing Mode');
    console.log('============================');
  } else {
    console.log('📄 Transcription Content');
    console.log('=========================');
  }
  
  const transcriptionContent = await readTranscription();
  
  if (transcriptionContent) {
    console.log('\n' + transcriptionContent);
    
    if (isAiTesting) {
      console.log('\n🔍 AI Testing Summary:');
      console.log(`- Content length: ${transcriptionContent.length} characters`);
      console.log(`- Word count: ${transcriptionContent.split(/\s+/).filter(word => word.length > 0).length} words`);
      console.log(`- Lines: ${transcriptionContent.split('\n').length}`);
    }
  } else {
    console.log('❌ Failed to read transcription content');
  }
}

main().catch(console.error);