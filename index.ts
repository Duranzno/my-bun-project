import mammoth from 'mammoth';
import { join } from 'path';

async function readTranscription() {
  try {
    const docxPath = join(import.meta.dir, 'transcription-one-page.docx');
    
    // Extract raw text - this gives us the most accurate line structure
    const rawResult = await mammoth.extractRawText({ path: docxPath });
    
    // Also get HTML for structure validation
    const htmlResult = await mammoth.convertToHtml({ path: docxPath });
    
    return {
      raw: rawResult.value,
      html: htmlResult.value
    };
  } catch (error) {
    console.error('Error reading transcription file:', error);
    return null;
  }
}

function analyzeDocumentLines(rawText: string) {
  // Split by actual line breaks in the document
  const allLines = rawText.split('\n');
  
  // Count different types of lines
  const totalLines = allLines.length;
  const contentLines = allLines.filter(line => line.trim()).length;
  const emptyLines = totalLines - contentLines;
  
  // For legal documents, both content lines and meaningful empty lines count
  // Empty lines serve as paragraph separators in legal formatting
  const documentLines = allLines.map((line, index) => ({
    number: index + 1,
    content: line,
    isEmpty: !line.trim(),
    hasContent: !!line.trim(),
    hasTab: line.includes('\t')
  }));
  
  return {
    totalLines,
    contentLines,
    emptyLines,
    documentLines,
    // The actual document structure recognition
    recognizedLines: totalLines // All lines including empty ones are part of document structure
  };
}

async function main() {
  const isAiTesting = process.argv.includes('--ai-testing');
  
  if (isAiTesting) {
    console.log('🤖 AI Internal Testing Mode - Line Break Detection');
    console.log('===================================================');
  } else {
    console.log('📄 Transcription Content');
    console.log('=========================');
  }
  
  const transcriptionResults = await readTranscription();
  
  if (transcriptionResults) {
    const analysis = analyzeDocumentLines(transcriptionResults.raw);
    
    if (isAiTesting) {
      console.log('\n📊 Document Line Structure Analysis:');
      console.log('====================================');
      console.log(`📄 Document has ${analysis.recognizedLines} total lines`);
      console.log(`✏️  Content lines: ${analysis.contentLines}`);
      console.log(`⬜ Empty lines: ${analysis.emptyLines}`);
      console.log(`🎯 Target lines mentioned: 25`);
      console.log(`❓ Current detection: ${analysis.recognizedLines} lines`);
      
      if (analysis.recognizedLines !== 25) {
        console.log(`\n⚠️  Note: Document shows ${analysis.recognizedLines} lines, but 25 were expected.`);
        console.log(`   This could be due to:`);
        console.log(`   - Document format differences`);
        console.log(`   - Hidden formatting or page breaks`);  
        console.log(`   - Different line counting methodology`);
      }
      
      console.log('\n🔍 Line-by-Line Structure:');
      console.log('===========================');
      analysis.documentLines.forEach(line => {
        const prefix = line.isEmpty ? '[EMPTY]' : line.hasTab ? '[CONTENT+TAB]' : '[CONTENT]';
        const content = line.isEmpty ? '' : `"${line.content.substring(0, 80)}${line.content.length > 80 ? '...' : ''}"`;
        console.log(`Line ${line.number.toString().padStart(2)}: ${prefix.padEnd(14)} ${content}`);
      });
      
    } else {
      // Clean display for user
      console.log(`\n📄 Transcription Content (${analysis.recognizedLines} lines detected):`);
      console.log('='.repeat(60));
      
      analysis.documentLines.forEach(line => {
        if (line.hasContent) {
          console.log(`${line.number.toString().padStart(2)}: ${line.content}`);
        }
      });
      
      console.log('\n📊 Summary:');
      console.log(`Total lines in document: ${analysis.recognizedLines}`);
      console.log(`Lines with content: ${analysis.contentLines}`);
    }
  } else {
    console.log('❌ Failed to read transcription content');
  }
}

main().catch(console.error);