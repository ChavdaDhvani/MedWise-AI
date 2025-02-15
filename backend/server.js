import express from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Symptom list
const symp_list = 
  ['fever', 'pleuritic pain', 'snuffle', 'throat sore', 'malaise', 'debilitation', 'symptom aggravating factors', 'chill', 'scleral icterus', 'nasal flaring', 'dysuria', 'lip smacking', 'headache', 'sneeze', 'snore', 'green sputum', 'shortness of breath', 'distress respiratory', 'blackout', 'extreme exhaustion', 'heme positive', 'pain abdominal', 'vomiting', 'disequilibrium', 'nausea', 'intoxication', 'haemorrhage', 'guaiac positive', 'pain', 'decreased body weight', 'sore to touch', 'dizziness', 'pain chest', 'sweat', 'sweating increased', 'nonsmoker', 'pressure chest', 'syncope', 'numbness', 'chest discomfort', 'st segment depression', 'worry', 't wave inverted', 'bradycardia', 'dyspnea', 'seizure', 'hypometabolism', 'aura', 'muscle twitch', 'drowsiness', 'tremor', 'unresponsiveness', 'hemiplegia', 'myoclonus', 'gurgle', 'sleepy', 'lethargy', 'wheelchair bound', 'hyperkalemia', 'orthopnea', 'rale', 'urgency of micturition', 'ascites', 'asthenia', 'apyrexial', 'mental status changes', 'difficulty', 'diarrhea', 'hypotension', 'breath sounds decreased', 'swelling', 'hypokinesia', 'lightheadedness', 'unwell', 'anorexia', 'sensory discomfort', 'history of - blackout', 'prostatism', 'hyponatremia', 'fall', 'unsteady gait', 'polyuria', 'nightmare', 'speech slurred', 'weight gain', 'fatigue', 'tired', 'agitation', 'motor retardation', 'mass of body structure', 'fatigability', 'prodrome', 'myalgia', 'general discomfort', 'dyspnea on exertion', 'asterixis', 'numbness of hand', 'photophobia', 'para 2', 'abortion', 'intermenstrual heavy bleeding', 'muscle hypotonia', 'hypotonic', 'previous pregnancies 2', 'heartburn', 'primigravida', 'abnormally hard consistency', 'proteinemia', 'paresthesia', 'titubation', 'dysarthria', 'painful swallowing', 'hoarseness', 'stridor', 'spasm', 'dysdiadochokinesia', 'ataxia', 'achalasia', 'stiffness', 'lesion', 'side pain', 'hirsutism', 'sniffle', 'distended abdomen', 'vertigo', 'bradykinesia', 'out of breath', 'urge incontinence', 'hallucinations auditory', 'suicidal', 'hoard', 'irritable mood', 'feeling hopeless', 'feeling suicidal', 'neologism', 'homelessness', 'sleeplessness', 'unconscious state', 'panic', 'wheezing', 'cough', 'chest tightness', 'non-productive cough', 'productive cough', 'tachypnea', 'breech presentation', 'cyanosis', 'spontaneous rupture of membranes', 'hallucinations visual', 'verbal auditory hallucinations', 'terrify', 'energy increased', 'mood depressed', 'decompensation', 'cicatrisation', 'scar tissue', 'loose associations', 'abscess bacterial', 'abdomen acute', 'air fluid level', 'catching breath', 'abdominal tenderness', 'flatulence', 'constipation', 'thicken', 'gravida 0', 'hematuria', 'tumor cell invasion', 'anosmia', 'metastatic lesion', 'food intolerance', 'night sweat', 'hemianopsia homonymous', 'satiety early', 'sedentary', 'angina pectoris', 'unhappy', 'labored breathing', 'hypothermia, natural', 'hematocrit decreased', 'hypoxemia', 'renal angle tenderness', 'feels hot/feverish', 'cushingoid facies', 'cushingoid habitus', 'emphysematous change', 'pansystolic murmur', 'jugular venous distention', 'systolic ejection murmur', 'mass in breast', 'retropulsion', 'erythema', 'estrogen use', 'burning sensation', 'formication', 'phonophobia', 'rolling of eyes', 'moody', 'ambidexterity', 'absences finding', 'facial paresis', 'neck stiffness', 'extrapyramidal sign', "Stahli's line", 'vision blurred', 'room spinning', 'rambling speech', 'clumsiness', 'dysesthesia', 'polymyalgia', 'passed stones', 'qt interval prolonged', 'paresis', 'hemodynamically stable', 'rhonchus', 'orthostasis', 'yellow sputum', 'mediastinal shift', 'impaired cognition', 'sinus rhythm', 'general unsteadiness', 'bruit', 'consciousness clear', 'redness', 'polydypsia', 'clonus', 'egophony', 'aphagia', 'paralyse', 'low back pain', 'charleyhorse', 'pain neck', 'lung nodule', 'atypia', 'urinary hesitation', 'dizzy spells', 'shooting pain', 'hyperemesis', 'welt', 'transaminitis', 'tinnitus', 'hydropneumothorax', 'superimposition', 'haemoptysis', 'difficulty passing urine', 'monoclonal', 'ecchymosis', 'pallor', 'pain back', 'arthralgia', 'sputum purulent', 'hypercapnia', 'patient non compliance', 'breakthrough pain', 'hepatosplenomegaly', 'moan', "Murphy's sign", 'colic abdominal', 'cardiovascular finding', 'cardiovascular event', 'groggy', 'gasping for breath', 'feces in rectum', 'catatonia', 'weepiness', 'withdraw', 'behavior hyperactive', 'hypertonicity', 'hypoalbuminemia', 'pruritus', 'stool color yellow', 'oliguria', 'unable to concentrate', 'st segment elevation', 'presence of q wave', 'palpitation', 'r wave feature', 'has religious belief', 'overweight', 'systolic murmur', 'left atrial hypertrophy', 'alcohol binge episode', 'hot flush', 'feeling strange', 'pustule', 'fecaluria', 'projectile vomiting', 'pneumatouria', 'cystic lesion', 'slowing of urinary stream', 'enuresis', 'no status change', 'bedridden', 'hypersomnolence', 'underweight', 'frail', 'uncoordination', 'posturing', 'tonic seizures', 'drool', 'pin-point pupils', 'tremor resting', 'paraparesis', 'fear of falling', 'para 1', 'disturbed family', 'hypersomnia', 'hyperhidrosis disorder', 'mydriasis', 'exhaustion', 'pericardial friction rub', 'cardiomegaly', 'large-for-dates fetus', 'immobile', 'flare', 'pulsus paradoxus', 'soft tissue swelling', 'poor dentition', 'adverse reaction', 'adverse effect', 'abdominal bloating', 'nervousness', 'splenomegaly', 'bleeding of vagina', 'hypoproteinemia', 'dullness', 'red blotches', 'no known drug allergies', 'fremitus', 'hunger', 'behavior showing increased motor activity', 'coordination abnormal', 'clammy skin', 'cachexia', 'flushing', 'choke', 'tenesmus', 'incoherent', 'lameness', 'claudication', 'stuffy nose', 'heavy legs', 'prostate tender', 'pain foot', 'bowel sounds decreased', 'decreased stool caliber', 'nausea and vomiting', 'indifferent mood', 'hepatomegaly', 'stupor', 'rigor - temperature-associated observation', 'hacking cough', 'dyspareunia', 'hypokalemia', 'floppy', "Heberden's node", 'focal seizures', 'abnormal sensation', 'stinging sensation', 'asymptomatic', 'rest pain', 'monocytosis', 'posterior rhinorrhea', 'hematochezia', 'macule', 'scratch marks', 'decreased translucency', 'hypesthesia', 'hyperacusis', 'breath-holding spell', 'retch', 'hyperventilation', 'excruciating pain', 'gag', 'pulse absent', 'awakening early', 'pain in lower limb', 'transsexual', 'photopsia', 'giddy mood', 'throbbing sensation quality', 'sciatica', 'frothy sputum', 'homicidal thoughts', 'verbally abusive behavior', 'barking cough', 'rapid shallow breathing', 'noisy respiration', 'nasal discharge present', 'milky', 'regurgitates after swallowing', 'blanch', 'elation', 'todd paralysis', 'alcoholic withdrawal symptoms', 'urinoma', 'hypocalcemia result', 'rhd positive', 'inappropriate affect', 'poor feeding', 'ache', 'macerated skin', 'heavy feeling', 'gravida 10'];

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'backend')));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Route for uploading images and processing with Tesseract
app.post('/image', upload.single('file'), (req, res) => {
  const imageFile = req.file.path;

  Tesseract.recognize(
    imageFile,
    'eng',
    {
      logger: (m) => console.log(m),
    }
  )
    .then(({ data: { text } }) => {
      res.json({ text });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error processing image');
    });
});

// Route for handling symptoms data
app.post('/find', (req, res) => {
  const symptoms = req.body.symptoms;

  // Example: Check if any symptoms match the list
  const matchedSymptoms = symptoms.filter(symptom => symp_list.includes(symptom.toLowerCase()));

  res.json({
    message: 'Symptoms processed',
    matchedSymptoms,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
